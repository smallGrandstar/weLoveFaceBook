var should = require('should');
var supertest = require('supertest');
var server = supertest.agent("http://localhost:3000");

//Testing the newPost API
describe('Test the APIs in post', function() {
    it('should list all posts on get method', function(done){
       server
       .get('/posts/allPosts')
       .end(function(err, res) {
           res.status.should.equal(200);
           res.body.success.should.equal(true);
           done();
       });
    });

    describe('Testing the newPost API', function() {
        it('should add a new post', function(done){
            server
            .post('/posts/newPost')
            .send({
                title: 'This is a test post',
                body: 'Someone is testing',
                createdBy: 'Zhuoru'
            })
            .end(function(err, res){
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.message.should.equal('Post saved successfully!');
                done();
            });
        });
    
        it('should return an empty title message', function(done){
            server
            .post('/posts/newPost')
            .send({
                title: '',
                body: 'Someone is testing',
                createdBy: 'Zhuoru'
            })
            .end(function(err, res){
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.message.should.equal('Post title is requested!');
                done();
            });
        });
    
        it('should return an empty body message', function(done){
            server
            .post('/posts/newPost')
            .send({
                title: 'This is a test',
                body: '',
                createdBy: 'Zhuoru'
            })
            .end(function(err, res){
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.message.should.equal('Post body is required!');
                done();
            });
        });
    
        it('should return an empty creator message', function(done){
            server
            .post('/posts/newPost')
            .send({
                title: 'This is a test',
                body: 'Someone is testing',
                createdBy: ''
            })
            .end(function(err, res){
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.message.should.equal('Post creator is required!');
                done();
            });
        });
    });
});

//Test the comment API
describe('Test the comment API', function(){
    it('should return no id provided', function(done){
        server
        .post('/posts/comment')
        .send({
            comment: 'Test of Zhuoru'
        })
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.success.should.equal(false);
            res.body.message.should.equal('No id was provided');
            done();
        });
    });

    it('should return no comment provided', function(done){
        server
        .post('/posts/comment')
        .send({
            id: '59fd61383358a747d3b632f9'
        })
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.success.should.equal(false);
            res.body.message.should.equal('No comment provided');
            done();
        });
    });

    it('should return user not found', function(done){
        server
        .post('/posts/comment')
        .send({
            id: '59fd6161fc6e8247e001f5a3',
            comment: 'Test comment of Zhuoru'
        })
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.success.should.equal(false);
            res.body.message.should.equal('Post not found.');
            done();
        });
    });

    it('should return invalid id', function(done){
        server
        .post('/posts/comment')
        .send({
            id: 'ObjectId("59fd6161fc6e8247e001f5a3")',
            comment: 'Test comment of Zhuoru'
        })
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.success.should.equal(false);
            res.body.message.should.equal('Invalid Post id');
            done();
        });
    });
});

//Testing the like API
