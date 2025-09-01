class UltraBrowser {
  constructor() {
    this.blockedSites = ["google.com", "www.google.com"];
    this.history = [];
  }

  visit(url) {
    if (this.isBlocked(url)) {
      console.warn(`Access denied: ${url} 🚫`);
      return `Access denied: ${url} 🚫`;
    }
    console.log(`Browsing: ${url}`);
    this.history.push(url);
    // Here you can integrate an iframe or fetch the page content
    return `Browsing: ${url}`;
  }

  isBlocked(url) {
    return this.blockedSites.some(blocked => url.includes(blocked));
  }

  getHistory() {
    return this.history;
  }

  addBlockedSite(url) {
    if (!this.blockedSites.includes(url)) this.blockedSites.push(url);
  }
}

export default new UltraBrowser();