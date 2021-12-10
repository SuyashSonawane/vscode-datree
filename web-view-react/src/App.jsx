import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [yamlFileErrors, setYamlFileErrors] = useState(null);
  const [k8sFileErrors, setK8sFileErrors] = useState(null);
  const [fileMapper, setFileMapper] = useState(null);
  const [vsCode, setVsCode] = useState(null);
  const [policyErrors, setPolicyErrors] = useState(null);
  window.addEventListener('message', message => {
    setData(message.data);
  })


  const sendMessage = (message) => {
    vsCode && vsCode.postMessage(message)
  }

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line no-undef
      !vsCode && setVsCode(acquireVsCodeApi());
      setYamlFileErrors(data.InvalidYamlFiles)
      setK8sFileErrors(data.InvalidK8sFiles)
    }
    // else {
    //   setData(JSON.parse(atob(window.location.hash.split('#')[1])).data)
    //   setPop(JSON.parse(atob(window.location.hash.split('#')[1])).pop)

    // }
  }, [data])

  useEffect(() => {
    if (data && !yamlFileErrors && !k8sFileErrors && data.EvaluationResults.Summary.TotalPassedCount !== 1) {
      setFileMapper(Object.entries(data.EvaluationResults.FileNameRuleMapper)[0])
    }
  }, [data, k8sFileErrors, yamlFileErrors])

  useEffect(() => {
    fileMapper && setPolicyErrors(Object.entries(fileMapper[1]))
  }, [fileMapper])

  return (
    data ?
      <>
        <h1>Evaluation Results {data.EvaluationSummary.PassedPolicyCheckCount === 0 ? "🔴" : "🟢"}</h1>
        {data.EvaluationSummary.PassedPolicyCheckCount > 0 &&
          <div className='party-pop'>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        }
        <tt>Type: {data.type}</tt> <br />
        {data.config_path
          &&
          <tt>Config File Path: {data.config_path} <br /></tt>
        }
        <tt>{data.ts}</tt>
        <hr />
        <div className="summary-container">
          <div>
            <h2>Details</h2>
            <ul>
              <li>K8s Schema Version: {data.K8sSchemaVersion}</li>
              {
                Object.entries(data.EvaluationSummary).map(entry => (
                  <li>{entry[0].replace(/([A-Z])/g, " $1")}: {entry[1]}</li>
                ))
              }
            </ul>
          </div>
          <div className="summary">
            <h2>Summary</h2>
            <ul>
              {
                Object.entries(data.EvaluationResults.Summary).map(entry => (
                  <li>{entry[0].replace(/([A-Z])/g, " $1")}: {entry[1]}</li>
                ))
              }
            </ul>
          </div>
        </div>
        <hr />
        {(!yamlFileErrors && !k8sFileErrors && policyErrors)
          &&
          <>
            <h2>Policy Checks</h2>
            <h4>File :{fileMapper[0]}</h4>
            <div className="policy-errors">
              {
                policyErrors.map(e => (
                  <div className="policy-error" title={`View solution for:   ${e[1].Name}`} onClick={() => sendMessage(e[1].FailSuggestion)}>
                    <p>ID : {e[0]}</p>
                    <p>Name :{e[1].Name}</p>
                    <p>Suggestion : {e[1].FailSuggestion}</p>
                    <br />
                  </div>
                ))
              }
            </div>
          </>
        }
        {
          k8sFileErrors &&
          <>
            <h2>K8s Schema Check Errors</h2>
            <h4>File: {k8sFileErrors[0].Path}</h4>
            <div className="policy-errors">
              {
                k8sFileErrors[0].ValidationErrors.map(e => (
                  <div className="policy-error">
                    <p>Error Message: {e.ErrorMessage}</p>
                    <br />
                  </div>
                ))
              }
            </div>
          </>
        }
        {
          yamlFileErrors &&
          <>
            <h2>YAML Check Errors</h2>
            <h4>File: {yamlFileErrors[0].Path}</h4>
            <div className="policy-errors">
              {
                yamlFileErrors[0].ValidationErrors.map(e => (
                  <div className="policy-error">
                    <p>Error Message: {e.ErrorMessage}</p>
                    <br />
                  </div>
                ))
              }
            </div>
          </>
        }
      </> : <h1>Loading...</h1>
  );
}

export default App;
