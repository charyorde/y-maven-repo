/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

var JiveContainer = function(configParams) {
    opensocial.Container.call(this, configParams);
};

var JiveEnvironment = function(config) {
	opensocial.Environment.call(this);

    this.marketId = config.marketId;
    this.version = config.version;
    this.jiveUrl = config.jiveUrl;
};
JiveEnvironment.inherits(opensocial.Environment);

JiveEnvironment.prototype.jive_getInstanceId = function() {
    return this.marketId;
}

JiveEnvironment.prototype.jive_getVersion = function() {
    return this.version;
}

gadgets.config.register("jive-opensocial-ext-v1", null,
						function(config) {
							var jsonRpcContainerEnvironment = opensocial.getEnvironment();
							for(var f in opensocial.Environment.prototype) {
								if(opensocial.Environment.prototype[f] instanceof Function) {
									JiveEnvironment.prototype[f] = (function(delegatee) {
										return function() {
                                            var args = Array.prototype.slice.call(arguments);
											return delegatee.apply(jsonRpcContainerEnvironment, args);
										}
									})(opensocial.Environment.prototype[f]);
								}
							}

							JiveContainer = function() {
								JsonRpcContainer.call(this, gadgets.config.get("opensocial"));
                                var containerConfig = gadgets.config.get("jive-opensocial-ext-v1");
								this.environment_ = new JiveEnvironment(containerConfig);
							};

							JiveContainer.inherits(JsonRpcContainer);
							opensocial.Container.setContainer(new JiveContainer());
						});
