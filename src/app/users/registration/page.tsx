// User Registration Page
// ~/users/registration
// This page is for users to register for an account
// It will be used to create a new user in the database
// It will allow users to sign up with their email and password

import UserRegistration from "~/app/_components/users/userRegistration";

export default function RegistrationPage() {

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <UserRegistration />
    </div>
  );
}
