export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
          'auth', 'catalog', 'cart', 'orders', 'payments', 'inventory',
          'notifications', 'analytics', 'gateway', 'web', 'admin',
          'infra', 'ci', 'deps', 'deps-dev', 'deps-prod', 'docs', 'repo'
      ],
    ],
  },
};
