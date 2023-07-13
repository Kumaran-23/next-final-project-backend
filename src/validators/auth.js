export function validateAuth(input) {
  const validationErrors = {}

  if (!('email' in input) || input['email'].length == 0) {
    validationErrors['email'] = 'Cannot be blank'
  }

  if (!('password' in input) || input['password'].length == 0) {
    validationErrors['password'] = 'Cannot be blank'
  }

  if ('email' in input && !input['email'].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    validationErrors['email'] = 'Email is invalid'
  }

  return validationErrors
}