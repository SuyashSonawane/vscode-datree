# VSCode Datree

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/suyashsonawane.vscode-datree.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=suyashsonawane.vscode-datree)

Simple VSCode Extension that allows you to run **Datree** tests on Kubernetes configurations.

![Demo](media/head.gif)

# Features

- Helm Support
- YAML Errors Highlighting
- K8s Schema Error Highlighting
- Ability to change test configuration.
- Solution Suggestions

## Helm Support

Helm `Chart.yml` can be easily tested by the same flow <br/>
_Requires helm plugin installed, can be installed from [datree helm plugin](https://hub.datree.io/helm-plugin)_

![Helm](media/helm.gif)

# Requirements

- [Datree](https://www.datree.io/)
- [Helm](https://helm.sh/docs/intro/install/) (only required to run helm tests)

# Known Issues

- Error highlighting is limited, due to CLI restrictions
- Windows platform is not currently supported

# Release Notes

### 0.0.1

Initial release of extension

### 0.0.2

Added solution links

# Acknowledgement

<img src="media/datree-logo.png" width="300px"> <br/>
This extension is built for **Datree** as a part of Cloud Native Hackathon
