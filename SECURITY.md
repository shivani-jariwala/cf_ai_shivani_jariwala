# 🔒 Security Guidelines

## Environment Variables

Never commit sensitive environment variables to the repository. All secrets should be stored in environment variables or Cloudflare secrets.

### Required Environment Variables

Create a `.dev.vars` file for local development (this file is gitignored):

```bash
# Cloudflare Account ID
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Realtime (optional for voice features)
REALTIME_APP_ID=your_realtime_app_id
REALTIME_TOKEN=your_realtime_token
```

### Production Secrets

For production deployment, use Cloudflare secrets:

```bash
# Set secrets using Wrangler
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put REALTIME_APP_ID
wrangler secret put REALTIME_TOKEN
```

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use `.dev.vars` for local development
- ✅ Use Cloudflare secrets for production
- ✅ Rotate secrets regularly

### 2. API Keys and Tokens
- ✅ Store in environment variables only
- ✅ Never hardcode in source code
- ✅ Use least privilege principle
- ✅ Monitor usage and rotate regularly

### 3. CORS Configuration
- ✅ Restrict origins to known domains
- ✅ Use HTTPS in production
- ✅ Validate all incoming requests

### 4. Input Validation
- ✅ Sanitize all user inputs
- ✅ Validate file uploads
- ✅ Rate limit API endpoints
- ✅ Implement proper error handling

### 5. Database Security
- ✅ Use parameterized queries
- ✅ Implement proper access controls
- ✅ Encrypt sensitive data
- ✅ Regular backups

## 🚨 Security Checklist

Before deploying to production:

- [ ] All secrets stored in environment variables
- [ ] No hardcoded API keys in source code
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting enabled
- [ ] Error handling doesn't expose sensitive info
- [ ] HTTPS enforced
- [ ] Database access properly secured
- [ ] Logging doesn't include sensitive data
- [ ] Dependencies updated to latest versions

## 🔍 Security Monitoring

### Logging
- Monitor for suspicious activity
- Log authentication attempts
- Track API usage patterns
- Alert on unusual behavior

### Regular Audits
- Review access logs
- Check for exposed secrets
- Update dependencies
- Test security measures

## 📞 Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Email security concerns privately
3. Include steps to reproduce
4. Provide your contact information

## 🛡️ Additional Resources

- [Cloudflare Security Best Practices](https://developers.cloudflare.com/workers/learning/security/)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
