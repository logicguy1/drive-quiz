const config = {
  // baseurl: "http://10.128.138.4:5000",
  //baseurl: "https://192.168.1.125:5000",
  baseurl: window.location.port === 80 ? `https://${window.location.hostname}` : `https://${window.location.hostname}:${window.location.port}`
}

export default config;
