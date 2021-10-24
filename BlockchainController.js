/**
 *          BlockchainController
 *
 * This class expose the endpoints that the client applications will use to interact with the
 * Blockchain dataset
 */
class BlockchainController {
  //The constructor receive the instance of the express.js app and the Blockchain class
  constructor(app, blockchainObj) {
    this.app = app;
    this.blockchain = blockchainObj;
    // All the endpoints methods needs to be called in the constructor to initialize the route.
    this.getBlockByHeight();
    this.requestOwnership();
    this.submitStar();
    this.getBlockByHash();
    this.getStarsByOwner();
    this.getBlock();
    this.validateChain();
  }

  async getBlock() {
    this.app.get('/block/:index', async (req, res) => {
      if (req.params.index) {
        try {
          let block = await this.blockchain.getBlockByHeight(+req.params.index);
          return res.status(200).json(block);
        } catch (e) {
          res.status(500).json(e + '');
        }
      } else {
        return res
          .status(500)
          .json('Invalid parameter: ' + JSON.stringify(req.params.index));
      }
    });
  }

  // Enpoint to Get a Block by Height (GET Endpoint)
  getBlockByHeight() {
    this.app.get('/block/height/:height', async (req, res) => {
      const height =
        req.params && req.params.height ? +req.params.height : null;

      try {
        const block = await this.blockchain.getBlockByHeight(height);
        if (block) {
          return res.status(200).json(block);
        } else {
          return res.status(404).send('Block Not Found!');
        }
      } catch (e) {
        res.status(500).send(e + '');
      }
    });
  }

  // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
  requestOwnership() {
    this.app.post('/requestValidation', async (req, res) => {
      if (req.body.address) {
        const address = req.body.address;
        const message =
          await this.blockchain.requestMessageOwnershipVerification(address);
        if (message) {
          return res.status(200).json(message);
        } else {
          return res.status(500).send('An error happened!');
        }
      } else {
        return res.status(500).send('Check the Body Parameter!');
      }
    });
  }

  // Endpoint that allow Submit a Star, yu need first to `requestOwnership` to have the message (POST endpoint)
  submitStar() {
    this.app.post('/submitstar', async (req, res) => {
      if (
        req.body.address &&
        req.body.message &&
        req.body.signature &&
        req.body.star
      ) {
        const address = req.body.address;
        const message = req.body.message;
        const signature = req.body.signature;
        const star = req.body.star;
        try {
          let block = await this.blockchain.submitStar(
            address,
            message,
            signature,
            star
          );
          if (block) {
            return res.status(200).json(block);
          } else {
            return res.status(500).send('An error happened!');
          }
        } catch (error) {
          return res.status(500).send(error);
        }
      } else {
        return res.status(500).send('Check the Body Parameter!');
      }
    });
  }

  // This endpoint allows you to retrieve the block by hash (GET endpoint)
  getBlockByHash() {
    this.app.get('/block/hash/:hash', async (req, res) => {
      if (req.params.hash) {
        try {
          const hash = req.params.hash;
          let block = await this.blockchain.getBlockByHash(hash);
          if (block) {
            return res.status(200).json(block);
          } else {
            return res.status(404).send('Block Not Found!');
          }
        } catch (e) {
          return res.status(500).send(e + '');
        }
      } else {
        return res.status(404).send('Block Not Found! Review the Parameters!');
      }
    });
  }

  // This endpoint allows you to request the list of Stars registered by an owner
  getStarsByOwner() {
    this.app.get('/blocks/:address', async (req, res) => {
      if (req.params.address) {
        const address = req.params.address;
        try {
          let stars = await this.blockchain.getStarsByWalletAddress(address);
          return res.status(200).json(stars);
        } catch (error) {
          return res.status(500).send(error);
        }
      } else {
        return res.status(500).send('Block Not Found! Review the Parameters!');
      }
    });
  }

  // Validate the chain
  validateChain() {
    this.app.get('/validate', async (req, res) => {
      const validations = await this.blockchain.validateChain();
      return res.status(200).json(validations);
    });
  }
}

module.exports = (app, blockchainObj) => {
  return new BlockchainController(app, blockchainObj);
};
