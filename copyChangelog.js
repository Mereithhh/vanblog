const insertLog = () => {
  const fs = require("fs");
  const log = fs.readFileSync("CHANGELOG.md", { encoding: "utf-8" });
  const newLog = "---\ntitle: 更新日志\nicon: update\n---\n\n" + log;

  fs.writeFileSync("docs/ref/changelog.md", newLog, { encoding: "utf-8" });
};
insertLog();
