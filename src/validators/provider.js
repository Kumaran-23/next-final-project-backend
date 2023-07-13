// Validate provider sign up form
export function validateProvider(input) {
  const validationErrors = {}

  if (!('name' in input) || input['name'].length == 0) {
    validationErrors['name'] = 'Cannot be blank'
  }

  if (!('email' in input) || input['email'].length == 0) {
    validationErrors['email'] = 'Cannot be blank'
  }

  if (!('password' in input) || input['password'].length == 0) {
    validationErrors['password'] = 'Cannot be blank'
  }

  if (!('hourly_rate' in input) || input['hourly_rate'].length == 0) {
    validationErrors['hourly_rate'] = 'Cannot be blank'
  }

  if (!('file' in input) || input['file'].length == 0) {
    validationErrors['file'] = 'A photo is required to become a provider'
  }

  if ('password' in input && input['password'].length < 8) {
    validationErrors['password'] = 'Should be at least 8 characters'
  }

  if ('email' in input && !input['email'].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    validationErrors['email'] = 'Email is invalid'
  }

  return validationErrors
}