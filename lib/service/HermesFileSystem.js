enyo.kind({
	name: "HermesFileSystem",
	kind: "enyo.Object",
	debug: false,
	events: {
		onLogin: "",
		onFailure: ""
	},
	create: function() {
		this.inherited(arguments);
		this.auth = undefined;
	},
	isOk: function() {
		return !!this.config.origin;
	},
	setConfig: function(inConfig) {
		this.log(inConfig);
		this.config = inConfig;
		if (inConfig.auth) {
			this.auth = inConfig.auth;
		}
	},
	getConfig: function() {
		return this.config;
	},
	//* @private
	_requestDic: {
		'GET':		{verb: 'GET', handleAs: "text"},	// text means no processing/no transformations, provided the charset is not understandable by the browser.
		'PROPFIND':	{verb: 'GET', handleAs: "json"},
		'PUT':		{verb: 'POST', handleAs: "json"},
		'MKCOL':	{verb: 'POST', handleAs: "json"},
		'COPY':		{verb: 'POST', handleAs: "json"},
		'MOVE':		{verb: 'POST', handleAs: "json"},
		'DELETE':	{verb: 'POST', handleAs: "json"}
	},
	//* @private
	_request: function(inMethod, inNodeId, inParams) {
		if (this.debug) this.log(inMethod, inNodeId, inParams);
		if (!this.config.origin) {
			throw "Service URL not yet defined";
		}
		if (this.auth) {
			if (this.debug) this.log(this.auth);
			inParams = enyo.mixin(inParams, {
				token: this.auth.token,
				secret: this.auth.secret
			});
		}
		var url = this.config.origin + this.config.pathname + '/id/' + inNodeId + '?_method=' + inMethod;
		var method = this._requestDic[inMethod].verb;
		if (this.debug) this.log(inMethod+"/"+method+": '"+url+"'");
		if (this.debug) console.dir(inParams);
		var req = new enyo.Ajax({
			url: url,
			method: method,
			handleAs: this._requestDic[inMethod].handleAs
		});
		req.response(function(inSender, inValue){
			if (this.debug) this.log("inValue=", inValue);
			if (this.xhr.status === 0 && !inValue) {
				// work-around ENYO-970
				this.fail();
				return null;
			} else {
				return inValue;
			}
		}).error(function(inSender, inResponse) {
			this.log("*** status="+ inResponse);
			if (inResponse === 0 && this.notifyFailure) {
				this.notifyFailure();
			}
			return inResponse ; // for the daisy chain
		});
		return req.go(inParams);
	},
	propfind: function(inNodeId, inDepth) {
		return this._request("PROPFIND", inNodeId, {depth: inDepth} /*inParams*/)
			.response(function(inSender, inValue) {
				if (this.debug) this.log(inValue);
				return inValue;
			});
	},
	listFiles: function(inFolderId, depth) {
		return this.propfind(inFolderId, depth)
			.response(function(inSender, inValue) {
				return inValue.children;
			});
	},
	getFile: function(inFileId) {
		return this._request("GET", inFileId, null /*inParams*/)
			.response(function(inSender, inValue) {
				return { content: inValue };
			});
	},
	putFile: function(inFileId, inContent) {
		try {
			var content = btoa(inContent); // base64encode
			return this._request("PUT", inFileId, {
				content: content
			} /*inParams*/);
		} catch(error) {
			return new AsyncError("Unable to save the file: " + error);
		}
	},
	createFile: function(inFolderId, inName, inContent) {
		return this._request("PUT", inFolderId, { name: inName, content:  btoa(inContent || '') } /*inParams*/)
			.response(function() {
				return inFolderId;
			});
	},
	createFolder: function(inFolderId, inName) {
		var newFolder = inFolderId + "/" + inName;
		return this._request("MKCOL", inFolderId, {name: inName} /*inParams*/)
			.response(function(inSender, inResponse) {
				// FIXME: id of created folder needs to be returned from service
				// FTP node server returns an object, includes 'id' field
				// DROPBOX node server returns an object, has no 'id' field
				//this.log("AresProvider.createFolder: inResponse = ", inResponse);
				if (this.debug) this.log(inResponse);
				return inResponse.id || inResponse.path || newFolder;
			});
	},
	remove: function(inNodeId) {
		return this._request("DELETE", inNodeId, null /*inParams*/);
	},
	rename: function(inNodeId, inNewName) {
		return this._request("MOVE", inNodeId, {name: inNewName} /*inParams*/);
	},
	copy: function(inNodeId, inNewName) {
		return this._request("COPY", inNodeId, {name: inNewName}  /*inParams*/);
	}
});
