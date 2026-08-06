<?php

use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'phone' => '0911223344',
        'password' => 'StrongPass#123',
        'password_confirmation' => 'StrongPass#123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('business.setup', absolute: false));
});
