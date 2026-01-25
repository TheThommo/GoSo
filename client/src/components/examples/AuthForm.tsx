import AuthForm from '../AuthForm';

export default function AuthFormExample() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <AuthForm
        onLogin={(email, password) => console.log('Login:', { email, password: '***' })}
        onRegister={(email, password, name) => console.log('Register:', { email, password: '***', name })}
        onSpectatorAccess={(code) => console.log('Spectator access:', code)}
        isLoading={false}
      />
    </div>
  );
}