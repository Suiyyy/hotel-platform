import { Component, type ErrorInfo, type PropsWithChildren } from 'react'
import { View, Text, Button } from '@tarojs/components'

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Text style={{ fontSize: '16px', color: '#333', display: 'block' }}>
            页面出现异常
          </Text>
          <Text style={{ fontSize: '13px', color: '#999', display: 'block', marginTop: '8px' }}>
            {this.state.error?.message || '未知错误'}
          </Text>
          <Button
            style={{ marginTop: '20px', backgroundColor: '#0066cc', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '5px' }}
            onClick={this.handleRetry}
          >
            重试
          </Button>
        </View>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
