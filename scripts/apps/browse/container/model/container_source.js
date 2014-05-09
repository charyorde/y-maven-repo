/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Browse.Container');
/**
 * Interface to container REST service.
 *
 * @extends jive.RestService
 */
jive.Browse.Container.ItemSource = jive.RestService.extend(function(protect) {
    protect.resourceType = "container";

    /**
     * Get a container property.
     */
    this.getContainerProperty = function(params) {
       var url = this.RESOURCE_ENDPOINT + "/" + params.containerType + "/" + params.containerID + "/prop/" + params.propName;
       return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:{}});
    };

    /**
     * Set a container property.
     */
    this.setContainerProperty = function(params) {
       var url = this.RESOURCE_ENDPOINT + "/" + params.containerType + "/" + params.containerID + "/prop/" + params.propName;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:params.propValue});
    };

    /**
     * Removes a container property.
     */
    this.removeContainerProperty = function(params) {
       var url = this.RESOURCE_ENDPOINT + "/" + params.containerType + "/" + params.containerID + "/prop/" + params.propName;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'DELETE', {url:url});
    };

    /**
     *  Get a space's children.
     */
    this.getSpaceChildren = function(params) {
       var url = this.RESOURCE_ENDPOINT + "/" + params.containerID + "/children";
       return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:params});
    };

    /**
     * Get the BreadcrumbBean for a container
     */
    this.getBreadcrumbBean = function(params) {
        var url = this.RESOURCE_ENDPOINT + "/" + params.containerType + "/" + params.containerID + "/breadcrumbs";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:{}});
    }
});