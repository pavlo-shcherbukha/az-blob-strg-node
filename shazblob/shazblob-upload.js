
const { BlobServiceClient } = require("@azure/storage-blob");
const { ClientSecretCredential } = require("@azure/identity");
const { v1: uuidv1 } = require("uuid");

module.exports = function(RED) {
    function ShAzureBlobStorageUpload(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        this.config = RED.nodes.getNode(config.configname);
        if (this.config) {
            RED.log.info(`Storage Config Name: ${this.config.name}`);
        } else {
            this.error('Missing config setting');
        }



        const credential = new ClientSecretCredential(
            this.config.azure_tenant_id,
            this.config.azure_client_id,
            this.config.azure_client_secret
          );
          const blobServiceClient = new BlobServiceClient(
            `https://${this.config.azure_storage_account_name}.blob.core.windows.net`,
            credential
          );
     
        this.on('input', async (msg) => {
            const options = {
                buffer: msg.payload,
                //filePath: msg.filePath || config.filePath,
                // Allow blobName to be overwritten by msg.blobName
                blobName: msg.blobName || config.blobName,
                containerName: msg.containerName || config.containerName
            };
            try {
                const containerName = msg.containerName || options.containerName;
                const blobeName = msg.blobName || options.blobName;
                const imageContent = msg.buffer || options.buffer; 
                await uploadBlob( containerName, blobeName, imageContent);
                msg.payload = res;
                this.send(msg);
            } catch(e) {
                // Clear status in the node
                this.status({});
                // Send error to catch node, original msg object must be provided
                this.error(e.message, msg);
            }
        });
    }

    RED.nodes.registerType("shazblobstorage-upload", ShAzureBlobStorageUpload);
}
