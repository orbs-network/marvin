const helloWorld = {
    meta: {
        description: 'This is a very simple job description'
    },
    start() {
        console.log('hello world!')
        return Promise.resolve({ ok: true, status: 'PENDING' });
    }
};

module.exports = helloWorld;