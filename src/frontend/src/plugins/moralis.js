import Moralis from "moralis";

Moralis.start({
  serverUrl: process.env.VUE_APP_MORALIS_SERVER_URL ?? 'https://vak5qo7vurpm.usemoralis.com:2053/server',
  appId: process.env.VUE_APP_MORALIS_APP_ID ?? 'JT3ErHsXLGw47CpzJouVsURLpKRLXiqHkicZ6eWJ',
});

export default Moralis;