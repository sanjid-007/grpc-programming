const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const uuid = require('uuid');

const packageDefinition = protoLoader.loadSync('proto/user.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const user_proto = grpc.loadPackageDefinition(packageDefinition).UserService;

const server = new grpc.Server();

const users = [];

server.addService(user_proto.service, {
    Register: (call, callback) => {
        const { username, email, password } = call.request;
        const id = uuid.v4();
        const newUser = { id, username, email, password, bio: '' };
        users.push(newUser);
        callback(null, newUser);
    },
    Login: (call, callback) => {
        const { username, password } = call.request;
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            callback(null, user);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: 'Invalid username or password'
            });
        }
    },
    SetProfile: (call, callback) => {
        const updatedUser = call.request;
        const index = users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            callback(null, updatedUser);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: 'User not found'
            });
        }
    },
    GetProfile: (call, callback) => {
        const userId = call.request.id;
        const user = users.find(user => user.id === userId);
        if (user) {
            callback(null, user);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: 'User not found'
            });
        }
    },
    UpdateProfile: (call, callback) => {
        const updatedUser = call.request;
        const index = users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            callback(null, updatedUser);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: 'User not found'
            });
        }
    },
});

const bindAddress = '0.0.0.0:50051';
server.bindAsync(bindAddress, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(`Error starting server: ${error}`);
    } else {
        console.log(`Server running at http://${bindAddress}`);
        server.start();
    }
});
