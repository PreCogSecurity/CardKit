define([], function(){

// Typed error for CardKit runtime failures. Use `throw new CkError(...)`
// where the library would otherwise fail with an opaque TypeError, and
// `CkError.warn(...)` to surface silent failure paths without breaking
// callers that rely on the current return values.
var CkError = function(message){
    this.name = 'CkError';
    this.message = message || '';
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CkError);
    }
};

CkError.prototype = Object.create(Error.prototype);
CkError.prototype.constructor = CkError;

CkError.warn = function(message){
    if (typeof console !== 'undefined' && console.warn) {
        console.warn('[CardKit] ' + message);
    }
};

return CkError;

});