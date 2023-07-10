export function validateLocation(input) {
  const validationErrors = {}

  if (!('address' in input) || input['address'].length == 0) {
    validationErrors['name'] = 'cannot be blank'
  }

  return validationErrors
}