/**
 * Commit messages follow Conventional Commits, as the project guide asks:
 * `<type>(<scope>): <subject>`, subject in the imperative and under 72
 * characters. The body is free text, so its line length is not checked.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'perf',
        'docs',
        'test',
        'refactor',
        'style',
        'build',
        'ci',
        'revert',
      ],
    ],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}
