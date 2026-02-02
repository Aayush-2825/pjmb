# Contributing to Authentication Backend API

Thank you for considering contributing to this project! Here are some guidelines to help you get started.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- A clear description of the feature
- Use cases and benefits
- Possible implementation approach (optional)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Follow the code style**
   - Use ES6+ syntax
   - Use async/await instead of callbacks
   - Follow existing naming conventions
   - Add comments for complex logic

3. **Write tests** for new features
   - Unit tests for utilities
   - Integration tests for API endpoints
   - Ensure all tests pass: `npm test`

4. **Update documentation**
   - Update README.md if needed
   - Update API_DOCS.md for API changes
   - Add JSDoc comments to functions

5. **Commit your changes**
   ```bash
   git commit -m "Add: Brief description of your changes"
   ```
   
   Use conventional commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes
   - `Test:` for test additions/changes

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of the changes
   - Link related issues
   - Ensure CI checks pass

## 📝 Code Style Guidelines

### General
- Use meaningful variable and function names
- Keep functions small and focused
- Avoid deep nesting (max 3 levels)
- Use early returns to reduce complexity

### Naming Conventions
- **Variables/Functions**: camelCase (`getUserById`)
- **Classes**: PascalCase (`ApiError`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`)
- **Files**: kebab-case (`auth.controller.js`)

### Example Code Style

```javascript
// ✅ Good
const getUserById = async (userId) => {
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  return user;
};

// ❌ Bad
const getUser = async (id) => {
  const u = await User.findById(id);
  if (u) {
    return u;
  } else {
    throw new Error('Not found');
  }
};
```

## 🧪 Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Writing Tests
- Test happy paths and edge cases
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

```javascript
describe('Feature Name', () => {
  it('should perform expected behavior', async () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

## 🏗️ Project Structure

When adding new features, maintain the existing structure:

```
src/
├── config/        # Configuration files
├── controllers/   # Request handlers
├── db/            # Database connection
├── middlewares/   # Express middlewares
├── models/        # Mongoose models
├── routes/        # Route definitions
├── utils/         # Helper functions
└── validators/    # Zod schemas
```

## 🔍 Code Review Process

All pull requests will be reviewed for:
- Code quality and style
- Test coverage
- Documentation
- Security considerations
- Performance implications

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Zod Documentation](https://zod.dev/)
- [Jest Documentation](https://jestjs.io/)

## 💬 Questions?

Feel free to open an issue for any questions or join our discussions.

## 📜 License

By contributing, you agree that your contributions will be licensed under the project's ISC License.

---

Thank you for contributing! 🎉
