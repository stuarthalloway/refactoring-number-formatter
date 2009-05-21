# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_number-formatter-demo_session',
  :secret      => 'dc5b9e3196fe5df8241a8b4d7b04fdfba02a4712bac52b9b16f188a135305b97aa8c488e18eea76a0c58e21a896e2ef6abd8757a5487009d2f1904ba5e812cd2'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
