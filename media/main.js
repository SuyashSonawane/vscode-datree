// @ts-nocheck

(function () {
  const vscode = acquireVsCodeApi();
  const oldState = vscode.getState() || { schema: "1.18.0", policy: "default", ignoreMissingSchema: false };

  document.getElementById("schema").value = oldState.schema;
  document.getElementById("policy").value = oldState.policy;
  document.getElementById("ignore-missing-schema").checked = oldState.ignoreMissingSchema;
  document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    let schema = event.target.schema.value;
    let policy = event.target.policy.value;
    let ignoreMissingSchema = event.target.ignore.checked;
    vscode.setState({ schema, policy, ignoreMissingSchema });
    vscode.postMessage({ schema, policy, ignoreMissingSchema });
  });

  window.addEventListener("message", (event) => {
    const data = event.data;
    switch (data.type) {
      case 'fileType':
        document.getElementById("type").innerText = `Type: ${data.message}`;
        break;
      case 'command':
        {
          let command = document.getElementById('command');
          command.innerHTML = `[${new Date().toISOString()}]<br/><code>$ ${data.message}</code><br/><br/>` + command.innerHTML;
          break;
        }

    }
  });
})();
