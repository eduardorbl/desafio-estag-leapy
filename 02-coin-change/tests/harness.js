#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function loadRunnerConfig() {
  const yaml = require("yaml");
  const runnerPath = path.resolve(process.cwd(), "runner.yml");
  const content = fs.readFileSync(runnerPath, "utf8");
  return yaml.parse(content);
}

function runCase(command, workdir, input) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, {
      cwd: workdir,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", reject);

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Processo saiu com código ${code}. STDERR: ${stderr}`)
        );
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Saída não é JSON válido: ${stdout}`));
      }
    });

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}

(async () => {
  const casesPath = path.resolve(__dirname, "cases.json");
  const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));
  const { command, workdir = "." } = loadRunnerConfig();

  let passed = 0;
  for (const [i, c] of cases.entries()) {
    try {
      const out = await runCase(
        command,
        path.resolve(process.cwd(), workdir),
        c.input
      );
      const expected = JSON.stringify(c.output);
      const got = JSON.stringify(out);
      if (expected !== got) {
        console.error(
          `Case #${i + 1} falhou. Esperado=${expected}, Obtido=${got}`
        );
        process.exit(1);
      }
      passed += 1;
    } catch (err) {
      console.error(`Case #${i + 1} erro: ${err.message}`);
      process.exit(1);
    }
  }
  console.log(`Todos os ${passed} casos passaram.`);
})();
