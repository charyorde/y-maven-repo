/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview This library augments gadgets.window with functionality
 * to change the width of a gadget dynamically.
 */

/**
 * @static
 * @class Provides operations for getting information about and modifying the window the gadget is
 *        placed in.
 * @name gadgets.window
 */
gadgets.window = gadgets.window || {};

// we wrap these in an anonymous function to avoid storing private data
// as members of gadgets.window.
(function() {

  /**
   * Adjusts the gadget width
   *
   * @param {number=}
   *          opt_width An optional preferred width in pixels. If not specified, will attempt to fit
   *          the gadget to its content.
   * @member gadgets.window
   */
  gadgets.window.adjustWidth = function(opt_width) {
    opt_width = parseInt(opt_width, 10);
    var newWidth = opt_width || gadgets.window.getWidth();
    gadgets.rpc.call(null, 'resize_iframe_width', null, newWidth);
  };
}());

/**
 * @see gadgets.window#adjustWidth
 */
var _IG_AdjustIFrameWidth = gadgets.window.adjustWidth;

// TODO Attach gadgets.window.adjustWidth to the onresize event
