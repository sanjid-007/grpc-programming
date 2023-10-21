const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

const packageDefinition = protoLoader.loadSync('proto/user.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const user_proto = grpc.loadPackageDefinition(packageDefinition).UserService;

const client = new user_proto('localhost:50051', grpc.credentials.createInsecure());

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function registerUser() {
    rl.question('Enter your username: ', (username) => {
        rl.question('Enter your email: ', (email) => {
            rl.question('Enter your password: ', (password) => {
                const user = {
                    username: username,
                    email: email,
                    password: password,
                    bio: 'Hello, I am a user!'
                };

                client.Register(user, (error, response) => {
                    if (!error) {
                        console.log('User registered:', response);
                        login(response.username, response.password);
                    } else {
                        console.error('Error:', error);
                        rl.close();
                    }
                });
            });
        });
    });
}

function login(username, password) {
    const credentials = {
        username: username,
        password: password
    };

    client.Login(credentials, (error, response) => {
        if (!error) {
            console.log('User logged in:', response);
            setProfile(response);
        } else {
            console.error('Error:', error);
            rl.close();
        }
    });
}

function setProfile(user) {
    rl.question('Enter your new bio: ', (bio) => {
        user.bio = bio;
        client.SetProfile(user, (error, response) => {
            if (!error) {
                console.log('Profile set:', response);
                updateProfile(response);
            } else {
                console.error('Error:', error);
                rl.close();
            }
        });
    });
}

function updateProfile(user) {
    rl.question('Enter your updated username: ', (username) => {
        rl.question('Enter your updated email: ', (email) => {
            rl.question('Enter your updated password: ', (password) => {
                rl.question('Enter your updated bio: ', (bio) => {
                    user.username = username;
                    user.email = email;
                    user.password = password;
                    user.bio = bio;

                    client.UpdateProfile(user, (error, response) => {
                        if (!error) {
                            console.log('Profile updated:', response);
                        } else {
                            console.error('Error:', error);
                        }
                        rl.close();
                    });
                });
            });
        });
    });
}

registerUser(); // Start the registration process when the script is run
