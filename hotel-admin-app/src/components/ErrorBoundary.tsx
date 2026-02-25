import { Component, type ErrorInfo, type PropsWithChildren } from 'react'
import { Button, Result } from 'antd'

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
        <Result
          status="error"
          title="页面出现异常"
          subTitle={this.state.error?.message || '未知错误'}
          extra={<Button type="primary" onClick={this.handleRetry}>重试</Button>}
        />
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
