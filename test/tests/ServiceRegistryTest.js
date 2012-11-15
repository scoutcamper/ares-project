enyo.kind({
	name: "ServiceRegistryTest",
	kind: enyo.TestSuite,
	components: [
		{name: "serviceRegistry", kind: "ServiceRegistry"}
	],    
	service: "home",
	testGetHomeService: function(service) {
		var self = this;
		this.$.serviceRegistry._reloadServices(function(err){
			if (err) {
				fail;
			} else {
				var s = self.$.serviceRegistry.resolveServiceId(self.service);
				self.finish(self.$.serviceRegistry.getServiceId(s) ? "" : "no '" + self.service + "' service registered");
			}
		});
	}
});
