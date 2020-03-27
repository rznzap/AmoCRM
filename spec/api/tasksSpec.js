import AmoCRM from '../../src/AmoCRM';
import config from '../support/config';

let client;

beforeEach( done => {
  client = new AmoCRM( config );
  client
    .connect()
    .then( done );
});

describe( 'AmoCRM API Task Interface', () => {
  it( 'should create task', done => {
    const task = new client.Task({
      text: 'Help other'
    });
    task.save()
      .then(({ id }) => {
        expect( id ).toBeDefined();
        done();
      });
  });

  it( 'should create and update task', done => {
    const task = new client.Task({
      text: 'empty task'
    });
    task.save()
      .then(() => {
        task.text = 'empty task manager';
        task.updated_at = Math.floor( new Date / 1000 ) + 10;
        return task.save();
      })
      .then(() => client.Task.findById( task.id ))
      .then(({ text }) => {
        expect( text ).toBe( 'empty task manager' );
        done();
      });
  });

  it( 'create task and remove it', done => {
    const task = new client.Task;
    task.text = 'Task for deletion';
    task.save()
      .then(() => task.remove())
      .then(() => client.Task.findById( task.id ))
      .then( removedTask => {
        expect( removedTask ).toBeUndefined();
        done();
      });
  });

  it( 'add task of taskable interface', done => {
    const lead = new client.Lead({
        name: 'HasTasks Lead'
      }),
      task = new client.Task({
        text: 'Lead Task'
      });
    lead.save()
      .then( lead => lead.tasks.add([ task ]))
      .then( task => {
        expect( task.id ).toBeDefined();
        return task.getElement();
      })
      .then( taskLead => {
        expect( taskLead.id ).toBe( lead.id );
        return lead.tasks;
      })
      .then( tasks => {
        expect( tasks.length ).toBe( 1 );
        expect( tasks[ 0 ].id ).toBe( task.id );
        done();
      })
  });
});