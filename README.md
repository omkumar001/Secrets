# Secrets

It's a secret web app which authenticates the user data at the login time and further encrypts the data during the registartion time and stores it in the DB.

# About

It ensures level 1-6 of security by --

- Encrypting the DB with the AES-256 encryption technique using the mongoose-encryption package.
- Further encrypting the password using the md5 hashing.
- Further securing using the bcrypt package which uses the salting and hashing method.

Using Session and Cookies using the passport.js
