export { Page }

function Page() {
  return (
    <>
      <h1>Sign In</h1>
      <form class="space-y-6 sm:mx-auto sm:w-full sm:max-w-md" action="#" method="POST">
        <div>
          <label
            htmlFor="email"
            class="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <div class="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              class="input input-primary"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            class="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div class="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              class="input input-primary"
            />
          </div>
        </div>

        <div>
          <button class="btn btn-primary w-full justify-center">Sign in</button>
        </div>
      </form>
    </>
  )
}
