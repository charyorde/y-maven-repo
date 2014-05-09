/**
 * Object.values(obj) -> [String]
 * - obj (Object): object to read values from
 *
 * Returns an array of the attribute values on `obj`.
 **/
if (typeof Object.values == 'undefined') {
    Object.values = function(obj) {
        var values = [];
        for ( var k in obj ) {
            if (obj.hasOwnProperty(k)) {
                values.push(obj[k]);
            }
        }
        return values;
    };
}
