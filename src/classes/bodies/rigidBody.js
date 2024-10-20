export class RigidBody {
    constructor(mass, velocity = { x: 0, y: 0 }, accelaration = { x: 0, y: 0 }, force = { x: 0, y: 0 }) {
        this.mass = mass;
        this.velocity = velocity;
        this.accelaration = accelaration;
        this.force = force;
    }
    
    // Accelartion doesnt work
    updatePhysics(deltaTime) {
        // this.updateAccelaration();
        this.updateVelocity(deltaTime);
        this.resetForce();
    }

    // updateAccelaration() {
    //     this.accelaration.x = this.force.x / this.mass;
    //     this.accelaration.y = this.force.y / this.mass;
    // }

    updateVelocity(deltaTime) {
        this.velocity.x += this.accelaration.x * deltaTime;
        this.velocity.y += this.accelaration.y * deltaTime;
    }

    applyForce(force) {
        this.force.x += force.x;
        this.force.y += force.y;
    }

    resetForce() {
        this.force.x = 0;
        this.force.y = 0;
    }
}

// F = m * a