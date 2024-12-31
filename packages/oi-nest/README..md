
## Config
- A `config.yaml` is needed to run this module. The location needs to be specified via `OI_CONFIG_FILE` environment variable.
-- The `config.yaml` needs to be a at a writable location to allow adaption after initialization
- A write-able `data/` directory is needed to store the IPFS/Helia-DB
-- If dockerized, consider volumes
-- If in Kubernetes, consider persistent volumes / PVC.

More detailed examples will be added later on.

## Wallets
- A wallets folder needs to exist. It should have at least `wallets/eip155/default.json`. 
-- This represents the default Wallet in the Ethereum JSON Keystore format. 
-- If you want to add a named wallet, add e.g. `wallets/eip155/alice.json`, which can then be used with the `"wallet": "alice"` option, e.g. when executing function calls.
-- Make sure that the password for each wallet in `wallets/eip155` is provided in `config.yaml`