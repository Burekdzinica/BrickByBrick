export class RigidBody {
    constructor(mass, velocity = { x: 0, y: 0 }, accelaration = { x: 0, y: 0 }) {
        this.mass = mass;
        this.velocity = velocity;
        this.accelaration = accelaration;
    }
    
    updatePhysics(deltaTime) {
        this.updateVelocity(deltaTime);
    }

    updateVelocity(deltaTime) {
        this.velocity.x += this.accelaration.x * deltaTime;
        this.velocity.y += this.accelaration.y * deltaTime;
    }
}

// F = m * a