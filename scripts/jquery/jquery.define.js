/**
 * Signals to jQuery that it is ok to export itself as a module using
 * our AMD implementation.
 *
 * https://github.com/amdjs/amdjs-api/wiki/AMD
 */
if(window.define && define.amd){
    define.amd.jQuery = true;
}
