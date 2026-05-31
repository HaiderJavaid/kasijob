const toBalance = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

export function buildLeaderboard(users, maxLeaders = 10) {
  return [...users]
    .map((user) => ({
      ...user,
      balance: toBalance(user.balance),
    }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, maxLeaders);
}
