enyo.kind({
	name: "ProviderListTest",
	kind: enyo.TestSuite,
	components: [
		{name: "serviceRegistry", kind: "ServiceRegistry"},	
		{name: "providerList", kind: "ProviderList"}
	],
	
	testGetCountInProviderList: function() {
		var self = this;
		this.$.serviceRegistry._reloadServices(function(err){
			if (err) {
				fail;
			} else {
				self.$.providerList.services = self.$.serviceRegistry.services;
				var count = self.$.providerList.services.length;
				self.finish(count ? "" : "no service in the providerList");
			}
		});
	}
});
