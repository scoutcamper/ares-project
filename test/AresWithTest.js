enyo.kind({
	name: "AresWithTest",
	kind: "FittableColumns",
	fit: true,
	components: [
		{kind: "AresRunner"},
		{tag: "iframe", src: "../ares/index.html", style: "width: 100%"} 
	],
	create: function() {
		this.inherited(arguments);
	},
});

enyo.kind({
	name: "AresRunner",
	kind: "FittableRows",
	components: [
		{kind: "onyx.Toolbar", classes: "onyx-menu-toolbar", style: "height: 65px", isContainer: true, name: "toolbar", components: [
			{content: "Runner Output", style: "margin-right: 10px"}
		]},
		{kind: "enyo.TestRunner"}
	],
	create: function() {
		this.inherited(arguments);
	},
});