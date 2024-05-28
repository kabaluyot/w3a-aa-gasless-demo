import { useEffect, useState } from "react";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

import "./App.css";
// import RPC from "./web3RPC";  // for using web3.js
import RPC from "./viemRPC"; // for using viem
// import RPC from "./ethersRPC"; // for using ethers.js

// Providers
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

// Wallet Services
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";

// Adapters
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
// import { WalletConnectV2Adapter, getWalletConnectV2Settings } from "@web3auth/wallet-connect-v2-adapter";
// import { MetamaskAdapter } from "@web3auth/metamask-adapter";
// import { TorusWalletAdapter, TorusWalletOptions } from "@web3auth/torus-evm-adapter";
// import { CoinbaseAdapter, CoinbaseAdapterOptions } from "@web3auth/coinbase-adapter";

import Loading from "./Loading";

const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io

const chainConfig = {
  chainId: "0xaa36a7", // Please use 0x1 for ETH Mainnet, 0x89 for Polygon Mainnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider: privateKeyProvider,
  sessionTime: 86400, // 1 day
  // useCoreKitKey: true,
};

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [walletServicesPlugin, setWalletServicesPlugin] = useState<WalletServicesPlugin | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth(web3AuthOptions as Web3AuthOptions);

        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: "optional",
          },
          adapterSettings: {
            uxMode: "redirect", // "redirect" | "popup"
            mfaSettings: {
              deviceShareFactor: {
                enable: true,
                priority: 1,
                mandatory: true,
              },
              backUpShareFactor: {
                enable: true,
                priority: 2,
                mandatory: true,
              },
              socialBackupFactor: {
                enable: true,
                priority: 3,
                mandatory: false,
              },
              passwordFactor: {
                enable: true,
                priority: 4,
                mandatory: false,
              },
            },
          },
        });
        web3auth.configureAdapter(openloginAdapter);

        // Wallet Services Plugin
        const walletServicesPlugin = new WalletServicesPlugin({
          walletInitOptions: {
            whiteLabel: {
              showWidgetButton: false,
              buttonPosition: "bottom-left",
            },
          },
        });
        setWalletServicesPlugin(walletServicesPlugin);
        web3auth.addPlugin(walletServicesPlugin);

        // read more about adapters here: https://web3auth.io/docs/sdk/pnp/web/adapters/

        // Only when you want to add External default adapters, which includes WalletConnect, Metamask, Torus EVM Wallet
        const adapters = await getDefaultExternalAdapters({ options: web3AuthOptions });
        adapters.forEach((adapter) => {
          web3auth.configureAdapter(adapter);
        });

        // adding wallet connect v2 adapter
        // const defaultWcSettings = await getWalletConnectV2Settings("eip155", ["1"], "04309ed1007e77d1f119b85205bb779d");
        // const walletConnectV2Adapter = new WalletConnectV2Adapter({
        //   ...(web3AuthOptions as BaseAdapterSettings),
        //   adapterSettings: { ...defaultWcSettings.adapterSettings },
        //   loginSettings: { ...defaultWcSettings.loginSettings },
        // });
        // web3auth.configureAdapter(walletConnectV2Adapter);

        // // adding metamask adapter
        // const metamaskAdapter = new MetamaskAdapter(web3AuthOptions as BaseAdapterSettings);
        // web3auth.configureAdapter(metamaskAdapter);

        // // adding torus evm adapter
        // const torusWalletAdapter = new TorusWalletAdapter(web3AuthOptions as TorusWalletOptions);
        // web3auth.configureAdapter(torusWalletAdapter);

        // // adding coinbase adapter
        // const coinbaseAdapter = new CoinbaseAdapter(web3AuthOptions as CoinbaseAdapterOptions);
        // web3auth.configureAdapter(coinbaseAdapter);

        setWeb3auth(web3auth);

        await web3auth.initModal();

        // await web3auth.initModal({
        //   modalConfig: {
        //     [WALLET_ADAPTERS.OPENLOGIN]: {
        //       label: "openlogin",
        //       loginMethods: {
        //         // Disable facebook and reddit
        //         facebook: {
        //           name: "facebook",
        //           showOnModal: false
        //         },
        //         reddit: {
        //           name: "reddit",
        //           showOnModal: false
        //         },
        //         // Disable email_passwordless and sms_passwordless
        //         email_passwordless: {
        //           name: "email_passwordless",
        //           showOnModal: false
        //         },
        //         sms_passwordless: {
        //           name: "sms_passwordless",
        //           showOnModal: false
        //         }
        //       }
        //     }
        //   }
        // });
        if (web3auth.connected) {
          setLoggedIn(true);
          // const rpc = new RPC(web3auth.provider as IProvider);
          // await rpc.initializeSmartAccount();
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.connect();
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    uiConsole();
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    uiConsole();
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    uiConsole();
    await web3auth.logout();
    setLoggedIn(false);
  };

  const showWCM = async () => {
    if (!walletServicesPlugin) {
      uiConsole("torus plugin not initialized yet");
      return;
    }
    uiConsole();
    await walletServicesPlugin.showWalletConnectScanner();
  };

  const showCheckout = async () => {
    if (!walletServicesPlugin) {
      uiConsole("torus plugin not initialized yet");
      return;
    }
    console.log(web3auth?.connected);
    await walletServicesPlugin.showCheckout();
  };

  const showWalletUi = async () => {
    if (!walletServicesPlugin) {
      uiConsole("torus plugin not initialized yet");
      return;
    }
    await walletServicesPlugin.showWalletUi();
  };

  const getChainId = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    const rpc = new RPC(web3auth.provider as IProvider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };

  const addChain = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    const newChain = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x89", // hex of 137, polygon mainnet
      rpcTarget: "https://rpc.ankr.com/polygon",
      // Avoid using public rpcTarget in production.
      // Use services like Infura, Quicknode etc
      displayName: "Polygon Mainnet",
      blockExplorerUrl: "https://polygonscan.com",
      ticker: "MATIC",
      tickerName: "MATIC",
      logo: "https://images.toruswallet.io/polygon.svg",
    };

    await web3auth?.addChain(newChain);
    uiConsole("New Chain Added");
  };

  const switchChain = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    await web3auth?.switchChain({ chainId: "0x89" });
    uiConsole("Chain Switched");
  };

  const getAccounts = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    const rpc = new RPC(web3auth.provider as IProvider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    const rpc = new RPC(web3auth.provider as IProvider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const getSmartAccountAddress = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    setLoader(true);
    const rpc = new RPC(web3auth.provider as IProvider);
    const address = await rpc.getSmartAccountAddress();
    uiConsole(`Smart account address: ${address}`);
    setLoader(false);
  };

  const getSmartAccountBalance = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    setLoader(true);
    const rpc = new RPC(web3auth.provider as IProvider);
    const balance = await rpc.getSmartAccountBalance();
    uiConsole(balance);
    setLoader(false);
  };

  const sendSmartAccountTransaction = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    setLoader(true);
    const rpc = new RPC(web3auth.provider as IProvider);
    const receipt = await rpc.sendSmartAccountTransaction();
    uiConsole(receipt);
    setLoader(false);
  };

  const sendTransaction = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    setLoader(true);
    const rpc = new RPC(web3auth.provider as IProvider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
    setLoader(false);
  };

  const signMessage = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    setLoader(true);
    const rpc = new RPC(web3auth.provider as IProvider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
    setLoader(false);
  };

  const getPrivateKey = async () => {
    if (!web3auth?.provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole();
    setLoader(true);
    const rpc = new RPC(web3auth.provider as IProvider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
    setLoader(false);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get ID Token
          </button>
        </div>
        <div>
          <button onClick={showWalletUi} className="card">
            Show Wallet UI
          </button>
        </div>
        <div>
          <button onClick={showWCM} className="card">
            Show Wallet Connect
          </button>
        </div>
        <div>
          <button onClick={showCheckout} className="card">
            Show Checkout
          </button>
        </div>
        <div>
          <button onClick={getChainId} className="card">
            Get Chain ID
          </button>
        </div>
        <div>
          <button onClick={addChain} className="card">
            Add Chain
          </button>
        </div>
        <div>
          <button onClick={switchChain} className="card">
            Switch Chain
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={getPrivateKey} className="card">
            Get Private Key
          </button>
        </div>

        <div>
          <button onClick={getSmartAccountAddress} className="card smart-account">
            Get Smart Account Address
          </button>
        </div>
        <div>
          <button onClick={getSmartAccountBalance} className="card smart-account">
            Get Smart Account Balance
          </button>
        </div>
        <div>
          <button onClick={sendSmartAccountTransaction} className="card smart-account">
            Send Smart Account Transaction
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
      {loader && <Loading />}
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/modal" rel="noreferrer">
          Web3Auth{" "}
        </a>
        & ReactJS Ethereum Example
      </h1>

      <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-pnp-examples/tree/main/web-modal-sdk/blockchain-connection-examples/evm-modal-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
        <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer">
          USDC Faucet
        </a>
        <a href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank" rel="noopener noreferrer">
          Eth Sepolia Faucet
        </a>
        <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeb3Auth%2Fweb3auth-pnp-examples%2Ftree%2Fmain%2Fweb-modal-sdk%2Fblockchain-connection-examples%2Fevm-modal-example&project-name=w3a-evm-modal&repository-name=w3a-evm-modal">
          <img src="https://vercel.com/button" alt="Deploy with Vercel" />
        </a>
      </footer>
    </div>
  );
}

export default App;
