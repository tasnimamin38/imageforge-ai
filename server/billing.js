export function fulfillPendingOrder(db, orderId) {
  if (!db || !Array.isArray(db.orders) || !Array.isArray(db.users)) {
    return { status: 'invalid-store' }
  }

  const order = db.orders.find((item) => item.id === orderId)
  if (!order) return { status: 'not-found' }
  if (order.status !== 'pending') return { status: 'already-processed' }

  const user = db.users.find((item) => item.email === order.email)
  if (!user) return { status: 'user-not-found' }

  if (!Number.isSafeInteger(order.credits) || order.credits < 0) {
    return { status: 'invalid-credits' }
  }

  const currentCredits = user.credits ?? 0
  if (!Number.isSafeInteger(currentCredits) || currentCredits < 0 ||
      !Number.isSafeInteger(currentCredits + order.credits)) {
    return { status: 'invalid-user-credits' }
  }

  if (order.kind === 'plan') {
    if (typeof order.plan !== 'string' || !order.plan) return { status: 'invalid-order' }
    user.plan = order.plan
  } else if (order.kind === 'pack') {
    if (typeof order.pack !== 'string' || !order.pack) return { status: 'invalid-order' }
    user.packs = Array.isArray(user.packs) ? user.packs : []
    user.packs = Array.from(new Set([...user.packs, order.pack]))
  } else {
    return { status: 'invalid-order' }
  }

  user.credits = currentCredits + order.credits
  order.status = 'paid'
  return { status: 'fulfilled', order, user }
}
