export const defaultRules = {
  apiVersion: "v1",
  policies: [
    {
      name: "Default",
      isDefault: true,
      rules: [
        {
          url: "https://hub.datree.io/prevent-ingress-forwarding-traffic-to-single-container",
          identifier: "INGRESS_INCORRECT_HOST_VALUE_PERMISSIVE",
          messageOnFailure:
            'Incorrect value for key `host` - specify host instead of using a wildcard character ("*")',
        },
        {
          url: "https://hub.datree.io/ensure-image-pinned-version",
          identifier: "CONTAINERS_MISSING_IMAGE_VALUE_VERSION",
          messageOnFailure:
            'Incorrect value for key `image` - specify an image version to avoid unpleasant "version surprises" in the future',
        },
        {
          url: "https://hub.datree.io/ensure-env-label",
          identifier: "DEPLOYMENT_MISSING_LABEL_ENV_VALUE",
          messageOnFailure:
            'Missing label object `env` - add a proper environment description (e.g. "prod", "testing", etc.) to the Deployment config',
        },
        {
          url: "https://hub.datree.io/ensure-cpu-request",
          identifier: "CONTAINERS_MISSING_CPU_REQUEST_KEY",
          messageOnFailure:
            "Missing property object `requests.cpu` - value should be within the accepted boundaries recommended by the organization",
        },
        {
          url: "https://hub.datree.io/ensure-cronjob-scheduler-valid",
          identifier: "CRONJOB_INVALID_SCHEDULE_VALUE",
          messageOnFailure:
            "Incorrect value for key `schedule` - the (cron) schedule expressions is not valid and therefor, will not work as expected",
        },
        {
          url: "https://hub.datree.io/ensure-valid-restart-policy",
          identifier: "WORKLOAD_INCORRECT_RESTARTPOLICY_VALUE_ALWAYS",
          messageOnFailure:
            "Incorrect value for key `restartPolicy` - any other value than `Always` is not supported by this resource",
        },
        {
          url: "https://hub.datree.io/ensure-cpu-limit",
          identifier: "CONTAINERS_MISSING_CPU_LIMIT_KEY",
          messageOnFailure:
            "Missing property object `limits.cpu` - value should be within the accepted boundaries recommended by the organization",
        },
        {
          url: "https://hub.datree.io/ensure-hpa-minimum-replicas",
          identifier: "HPA_MISSING_MINREPLICAS_KEY",
          messageOnFailure:
            "Missing property object `minReplicas` - the value should be within the accepted boundaries recommended by the organization",
        },
        {
          url: "https://hub.datree.io/prevent-node-port",
          identifier: "SERVICE_INCORRECT_TYPE_VALUE_NODEPORT",
          messageOnFailure:
            "Incorrect value for key `type` - `NodePort` will open a port on all nodes where it can be reached by the network external to the cluster",
        },
        {
          url: "https://hub.datree.io/prevent-using-host-pid",
          identifier: "CONTAINERS_INCORRECT_HOSTPID_VALUE_TRUE",
          messageOnFailure:
            "Incorrect value for key `hostPID` - running on the host’s PID namespace enables access to sensitive information from processes running outside the container",
        },
        {
          url: "https://hub.datree.io/prevent-deprecated-k8s-api-116",
          identifier: "K8S_DEPRECATED_APIVERSION_1.16",
          messageOnFailure:
            "Incorrect value for key `apiVersion` - the version you are trying to use is not supported by the Kubernetes cluster version (>=1.16)",
        },
        {
          url: "https://hub.datree.io/ensure-digest-tag",
          identifier: "CONTAINERS_MISSING_IMAGE_VALUE_DIGEST",
          messageOnFailure:
            "Incorrect value for key `image` - add a digest tag (starts with `@sha256:`) to represent an immutable version of the image",
        },
        {
          url: "https://hub.datree.io/prevent-using-host-ipc",
          identifier: "CONTAINERS_INCORRECT_HOSTIPC_VALUE_TRUE",
          messageOnFailure:
            "Incorrect value for key `hostIPC` - running on the host’s IPC namespace can be (maliciously) used to interact with other processes running outside the container",
        },
        {
          url: "https://hub.datree.io/ensure-minimum-two-replicas",
          identifier: "DEPLOYMENT_INCORRECT_REPLICAS_VALUE",
          messageOnFailure:
            "Incorrect value for key `replicas` - don't relay on a single pod to do all of the work. Running 2 or more replicas will increase the availability of the service",
        },
        {
          url: "HPA_MISSING_MAXREPLICAS_KEY",
          identifier: "HPA_MISSING_MAXREPLICAS_KEY",
          messageOnFailure:
            "Missing property object `maxReplicas` - the value should be within the accepted boundaries recommended by the organization",
        },
        {
          url: "https://hub.datree.io/ensure-readiness-probe",
          identifier: "CONTAINERS_MISSING_READINESSPROBE_KEY",
          messageOnFailure:
            "Missing property object `readinessProbe` - add a properly configured readinessProbe to notify kubelet your Pods are ready for traffic",
        },
        {
          url: "https://hub.datree.io/ensure-cronjob-deadline",
          identifier: "CRONJOB_MISSING_STARTINGDEADLINESECOND_KEY",
          messageOnFailure:
            "Missing property object `startingDeadlineSeconds` - set a time limit to the cron execution to allow killing it if exceeded",
        },
        {
          url: "https://hub.datree.io/prevent-cronjob-concurrency",
          identifier: "CRONJOB_MISSING_CONCURRENCYPOLICY_KEY",
          messageOnFailure:
            "Missing property object `concurrencyPolicy` - the behavior will be more deterministic if jobs won't run concurrently",
        },
        {
          url: "https://hub.datree.io/prevent-privileged-containers",
          identifier: "CONTAINERS_INCORRECT_PRIVILEGED_VALUE_TRUE",
          messageOnFailure:
            "Incorrect value for key `privileged` - this mode will allow the container the same access as processes running on the host",
        },
        {
          url: "https://hub.datree.io/prevent-deprecated-k8s-api-117",
          identifier: "K8S_DEPRECATED_APIVERSION_1.17",
          messageOnFailure:
            "Incorrect value for key `apiVersion` - the version you are trying to use is not supported by the Kubernetes cluster version (>=1.17)",
        },
        {
          url: "https://hub.datree.io/ensure-memory-request",
          identifier: "CONTAINERS_MISSING_MEMORY_REQUEST_KEY",
          messageOnFailure:
            "Missing property object `requests.memory` - value should be within the accepted boundaries recommended by the organization",
        },
        {
          url: "https://hub.datree.io/prevent-naked-pods",
          identifier: "K8S_INCORRECT_KIND_VALUE_POD",
          messageOnFailure:
            "Incorrect value for key `kind` - raw pod won't be rescheduled in the event of a node failure",
        },
        {
          url: "https://hub.datree.io/prevent-deafult-namespce",
          identifier: "WORKLOAD_INCORRECT_NAMESPACE_VALUE_DEFAULT",
          messageOnFailure:
            "Incorrect value for key `namespace` - use an explicit namespace instead of the default one (`default`)",
        },
        {
          url: "https://hub.datree.io/prevent-uid-conflicts",
          identifier: "CONTAINERS_INCORRECT_RUNASUSER_VALUE_LOWUID",
          messageOnFailure:
            "Incorrect value for key `runAsUser` - value should be above 10000 to reduce the chances the UID is already taken",
        },
        {
          url: "https://hub.datree.io/prevent-mounting-docker-socket",
          identifier: "CONTAINERS_INCORRECT_PATH_VALUE_DOCKERSOCKET",
          messageOnFailure:
            "Incorrect value for key `path` - avoid mounting the docker.socket becasue it can allow container breakout",
        },
        {
          url: "https://hub.datree.io/ensure-owner-label",
          identifier: "WORKLOAD_MISSING_LABEL_OWNER_VALUE",
          messageOnFailure:
            "Missing label object `owner` - add a proper owner label in order to know which person/team to ping when needed",
        },
        {
          url: "https://hub.datree.io/ensure-liveness-probe",
          identifier: "CONTAINERS_MISSING_LIVENESSPROBE_KEY",
          messageOnFailure:
            "Missing property object `livenessProbe` - add a properly configured livenessProbe to catch possible deadlocks",
        },
        {
          url: "https://hub.datree.io/ensure-memory-limit",
          identifier: "CONTAINERS_MISSING_MEMORY_LIMIT_KEY",
          messageOnFailure:
            "Missing property object `limits.memory` - value should be within the accepted boundaries recommended by the organization",
        },
        {
          url: "https://hub.datree.io/prevent-using-host-network",
          identifier: "CONTAINERS_INCORRECT_HOSTNETWORK_VALUE_TRUE",
          messageOnFailure:
            "Incorrect value for key `hostNetwork` - running on the host’s network namespace can allow a compromised container to sniff network traffic",
        },
        {
          url: "https://hub.datree.io/ensure-labels-value-valid",
          identifier: "WORKLOAD_INVALID_LABELS_VALUE",
          messageOnFailure:
            "Incorrect value for key(s) under `labels` - the vales syntax is not valid so the Kubernetes engine will not accept it",
        },
      ],
    },
  ],
};
