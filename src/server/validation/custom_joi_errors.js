/**
 * Builds a custom error object as result of joi validation.
 * This function considers only the relevant fields and creates an error message
 * with this schema ERROR.[FIELD].[TYPE], in order to support multi-language.
 * Link: https://medium.com/@Yuschick/building-custom-localised-error-messages-with-joi-4a348d8cc2ba
 * 
 * @param {*} errors the original errors object from joi validation
 */
function buildUsefulErrorObject(errors) {
    const usefulErrors = {};
    for (var errorIndex = 0; errorIndex < errors.length; errorIndex++) {
        const error = errors[errorIndex];
        if (!usefulErrors.hasOwnProperty(error.field.join('_'))) {
            usefulErrors[error.field.join('_')] = {
                code: `error.${error.field.join('_')}.${error.types[0]}`,
                messages: error.messages 
            };
        }
    }
    return usefulErrors;
};

module.exports = {
    buildUsefulErrorObject
}