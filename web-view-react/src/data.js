export const data = {
  "EvaluationResults": {
    "FileNameRuleMapper": {
      "C:\\Users\\SUYASH\\Desktop\\test.yaml": {
        "1": {
          "ID": 1,
          "Name": "Ensure each container image has a pinned (tag) version",
          "FailSuggestion": "Incorrect value for key `image` - specify an image version to avoid unpleasant \"version surprises\" in the future",
          "OccurrencesDetails": [
            {
              "MetadataName": "octopus-deployment",
              "Kind": "Deployment"
            }
          ]
        },
        "2": {
          "ID": 2,
          "Name": "Ensure each container has a configured memory request",
          "FailSuggestion": "Missing property object `requests.memory` - value should be within the accepted boundaries recommended by the organization",
          "OccurrencesDetails": [
            {
              "MetadataName": "octopus-deployment",
              "Kind": "Deployment"
            }
          ]
        },
        "3": {
          "ID": 3,
          "Name": "Ensure each container has a configured CPU request",
          "FailSuggestion": "Missing property object `requests.cpu` - value should be within the accepted boundaries recommended by the organization",
          "OccurrencesDetails": [
            {
              "MetadataName": "octopus-deployment",
              "Kind": "Deployment"
            }
          ]
        },
        "4": {
          "ID": 4,
          "Name": "Ensure each container has a configured memory limit",
          "FailSuggestion": "Missing property object `limits.memory` - value should be within the accepted boundaries recommended by the organization",
          "OccurrencesDetails": [
            {
              "MetadataName": "octopus-deployment",
              "Kind": "Deployment"
            }
          ]
        },
        "5": {
          "ID": 5,
          "Name": "Ensure each container has a configured CPU limit",
          "FailSuggestion": "Missing property object `limits.cpu` - value should be within the accepted boundaries recommended by the organization",
          "OccurrencesDetails": [
            {
              "MetadataName": "octopus-deployment",
              "Kind": "Deployment"
            }
          ]
        },
        "11": {
          "ID": 11,
          "Name": "Ensure each container has a configured liveness probe",
          "FailSuggestion": "Missing property object `livenessProbe` - add a properly configured livenessProbe to catch possible deadlocks",
          "OccurrencesDetails": [
            {
              "MetadataName": "octopus-deployment",
              "Kind": "Deployment"
            }
          ]
        },
        "12": {
          "ID": 12,
          "Name": "Ensure each container has a configured readiness probe",
          "FailSuggestion": "Missing property object `readinessProbe` - add a properly configured readinessProbe to notify kubelet your Pods are ready for traffic",
          "OccurrencesDetails": [
            {
              "MetadataName": "octopus-deployment",
              "Kind": "Deployment"
            }
          ]
        },
        "16": {
          "ID": 16,
          "Name": "Ensure Deployment has more than one replica configured",
          "FailSuggestion": "Incorrect value for key `replicas` - running 2 or more replicas will increase the availability of the service",
          "OccurrencesDetails": [
            {
              "MetadataName": "octopus-deployment",
              "Kind": "Deployment"
            }
          ]
        }
      }
    },
    "Summary": {
      "TotalFailedRules": 8,
      "FilesCount": 1,
      "TotalPassedCount": 0
    }
  },
  "EvaluationSummary": {
    "ConfigsCount": 1,
    "RulesCount": 21,
    "FilesCount": 1,
    "PassedYamlValidationCount": 1,
    "PassedK8sValidationCount": 1,
    "PassedPolicyCheckCount": 0
  },
  "InvalidYamlFiles": null,
  "InvalidK8sFiles": null
}