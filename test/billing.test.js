import test from 'node:test'
import assert from 'node:assert/strict'
import { fulfillPendingOrder } from '../server/billing.js'

function makeStore() {
  return {
    users: [{ email: 'buyer@example.com', plan: 'spark', credits: 80, packs: [] }],
    orders: [{
      id: 'order_1', email: 'buyer@example.com', kind: 'plan',
      plan: 'pulse', credits: 2500, status: 'pending',
    }],
  }
}

test('a pending plan order is fulfilled exactly once', () => {
  const db = makeStore()
  const first = fulfillPendingOrder(db, 'order_1')
  assert.equal(first.status, 'fulfilled')
  assert.equal(db.users[0].plan, 'pulse')
  assert.equal(db.users[0].credits, 2580)
  assert.equal(db.orders[0].status, 'paid')
  const second = fulfillPendingOrder(db, 'order_1')
  assert.equal(second.status, 'already-processed')
  assert.equal(db.users[0].credits, 2580)
})

test('a pack order adds the pack and credits only while pending', () => {
  const db = makeStore()
  db.orders[0] = {
    id: 'pack_1', email: 'buyer@example.com', kind: 'pack',
    pack: 'credit-pack', credits: 100, status: 'pending',
  }
  const result = fulfillPendingOrder(db, 'pack_1')
  assert.equal(result.status, 'fulfilled')
  assert.deepEqual(db.users[0].packs, ['credit-pack'])
  assert.equal(db.users[0].credits, 180)
})

test('an order with no matching user remains unfulfilled', () => {
  const db = makeStore()
  db.orders[0].email = 'missing@example.com'
  assert.equal(fulfillPendingOrder(db, 'order_1').status, 'user-not-found')
  assert.equal(db.orders[0].status, 'pending')
})

test('invalid credit amounts are rejected without mutating balances', () => {
  const db = makeStore()
  db.orders[0].credits = -1
  assert.equal(fulfillPendingOrder(db, 'order_1').status, 'invalid-credits')
  assert.equal(db.users[0].credits, 80)
  assert.equal(db.orders[0].status, 'pending')
})

test('unknown and already-settled order IDs are safe', () => {
  const db = makeStore()
  assert.equal(fulfillPendingOrder(db, 'missing').status, 'not-found')
  db.orders[0].status = 'cancelled'
  assert.equal(fulfillPendingOrder(db, 'order_1').status, 'already-processed')
  assert.equal(db.users[0].credits, 80)
})
