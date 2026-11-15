using System.Collections;
using UnityEngine;
using UnityEngine.InputSystem;

namespace BoxCrafter.Core
{
    /// <summary>
    /// Controls the 3D Player Box with realistic edge-rolling kinematics,
    /// jump physics, squash-and-stretch animations, and grid alignment.
    /// </summary>
    [RequireComponent(typeof(BoxCollider))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement Settings")]
        [SerializeField] private float rollDuration = 0.2f;
        [SerializeField] private float jumpForce = 5f;
        [SerializeField] private LayerMask groundLayer;
        [SerializeField] private LayerMask obstacleLayer;
        [SerializeField] private LayerMask pushableLayer;

        [Header("Visual Juice")]
        [SerializeField] private Transform visualModel;
        [SerializeField] private ParticleSystem moveDustParticles;
        [SerializeField] private ParticleSystem jumpParticles;
        [SerializeField] private float squashAmount = 0.2f;

        private bool isRolling = false;
        private bool isGrounded = true;
        private Vector3 boxSize = Vector3.one;

        public bool IsRolling => isRolling;
        public System.Action<Vector3> OnRollStarted;
        public System.Action OnRollCompleted;
        public System.Action OnJumped;

        private void Awake()
        {
            if (visualModel == null)
            {
                visualModel = transform;
            }
        }

        private void Update()
        {
            if (isRolling) return;

            Vector2 input = Vector2.zero;
            
            // Standard Keyboard / Gamepad Fallback
            if (Keyboard.current != null)
            {
                if (Keyboard.current.wKey.wasPressedThisFrame || Keyboard.current.upArrowKey.wasPressedThisFrame)
                    input.y = 1f;
                else if (Keyboard.current.sKey.wasPressedThisFrame || Keyboard.current.downArrowKey.wasPressedThisFrame)
                    input.y = -1f;
                else if (Keyboard.current.aKey.wasPressedThisFrame || Keyboard.current.leftArrowKey.wasPressedThisFrame)
                    input.x = -1f;
                else if (Keyboard.current.dKey.wasPressedThisFrame || Keyboard.current.rightArrowKey.wasPressedThisFrame)
                    input.x = 1f;

                if (Keyboard.current.spaceKey.wasPressedThisFrame && isGrounded)
                {
                    Jump();
                }
            }

            if (input != Vector2.zero)
            {
                Vector3 moveDir = new Vector3(input.x, 0, input.y).normalized;
                TryRoll(moveDir);
            }
        }

        /// <summary>
        /// Attempts to roll the box in the specified direction around its contact edge.
        /// </summary>
        public void TryRoll(Vector3 direction)
        {
            if (isRolling) return;

            Vector3 targetCenter = transform.position + direction;

            // Check if obstructed by static obstacles
            if (Physics.Raycast(transform.position, direction, 1f, obstacleLayer))
            {
                // Play bump / blocked feedback
                StartCoroutine(BlockedBump(direction));
                return;
            }

            // Check for pushable blocks
            if (Physics.Raycast(transform.position, direction, out RaycastHit hit, 1f, pushableLayer))
            {
                PushableBox pushable = hit.collider.GetComponent<PushableBox>();
                if (pushable != null && !pushable.TryPush(direction))
                {
                    StartCoroutine(BlockedBump(direction));
                    return;
                }
            }

            // Perform kinematic roll around bottom edge
            Vector3 anchor = transform.position + (direction * 0.5f) + (Vector3.down * 0.5f);
            Vector3 axis = Vector3.Cross(Vector3.up, direction);

            StartCoroutine(ExecuteRoll(anchor, axis, direction));
        }

        private IEnumerator ExecuteRoll(Vector3 anchor, Vector3 axis, Vector3 direction)
        {
            isRolling = true;
            OnRollStarted?.Invoke(direction);

            if (moveDustParticles != null)
            {
                moveDustParticles.Play();
            }

            float elapsed = 0f;
            float totalAngle = 90f;
            float lastAngle = 0f;

            while (elapsed < rollDuration)
            {
                elapsed += Time.deltaTime;
                float progress = Mathf.Clamp01(elapsed / rollDuration);
                // Ease out quad for punchy roll
                float eased = 1f - (1f - progress) * (1f - progress);
                float currentAngle = eased * totalAngle;
                float deltaAngle = currentAngle - lastAngle;

                transform.RotateAround(anchor, axis, deltaAngle);
                lastAngle = currentAngle;

                yield return null;
            }

            // Ensure exact remaining angle
            transform.RotateAround(anchor, axis, totalAngle - lastAngle);

            // Snap to grid integers to prevent floating-point drift
            Vector3 snappedPos = new Vector3(
                Mathf.Round(transform.position.x),
                Mathf.Round(transform.position.y),
                Mathf.Round(transform.position.z)
            );
            transform.position = snappedPos;

            isRolling = false;
            OnRollCompleted?.Invoke();
        }

        private void Jump()
        {
            if (jumpParticles != null)
            {
                jumpParticles.Play();
            }

            StartCoroutine(SquashAndStretch(0.15f));
            OnJumped?.Invoke();
        }

        private IEnumerator SquashAndStretch(float duration)
        {
            Vector3 initialScale = visualModel.localScale;
            Vector3 squashScale = new Vector3(initialScale.x * (1f + squashAmount), initialScale.y * (1f - squashAmount), initialScale.z * (1f + squashAmount));
            Vector3 stretchScale = new Vector3(initialScale.x * (1f - squashAmount), initialScale.y * (1f + squashAmount), initialScale.z * (1f - squashAmount));

            float halfDuration = duration * 0.5f;
            float elapsed = 0f;

            // Squash
            while (elapsed < halfDuration)
            {
                elapsed += Time.deltaTime;
                visualModel.localScale = Vector3.Lerp(initialScale, squashScale, elapsed / halfDuration);
                yield return null;
            }

            // Stretch & restore
            elapsed = 0f;
            while (elapsed < halfDuration)
            {
                elapsed += Time.deltaTime;
                visualModel.localScale = Vector3.Lerp(squashScale, initialScale, elapsed / halfDuration);
                yield return null;
            }

            visualModel.localScale = initialScale;
        }

        private IEnumerator BlockedBump(Vector3 direction)
        {
            isRolling = true;
            Vector3 originalPos = transform.position;
            Vector3 bumpTarget = originalPos + direction * 0.15f;

            float t = 0f;
            while (t < 0.08f)
            {
                t += Time.deltaTime;
                transform.position = Vector3.Lerp(originalPos, bumpTarget, t / 0.08f);
                yield return null;
            }

            t = 0f;
            while (t < 0.08f)
            {
                t += Time.deltaTime;
                transform.position = Vector3.Lerp(bumpTarget, originalPos, t / 0.08f);
                yield return null;
            }

            transform.position = originalPos;
            isRolling = false;
        }
    }
}
