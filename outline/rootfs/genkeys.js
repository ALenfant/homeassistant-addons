const { stdout } = require('node:process');
const { randomBytes } = require('crypto');

const args = process.argv.slice(2);
if ((args.length < 1) || (args.length > 1)) {
    console.log("Unexpected number of arguments")
    process.exit(1); // Return with error code
}

const length = parseInt(args[0], 10)
if (isNaN(length)) {
    console.log("Length is not a number " + args[0])
    process.exit(1); // Return with error code
}

const randomBytesBuffer = randomBytes(length);
const randomHex = randomBytesBuffer.toString('hex');
stdout.write(randomHex);