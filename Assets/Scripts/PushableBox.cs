using System.Collections;
using UnityEngine;

namespace BoxCrafter.Core
{
    /// <summary>
    /// Represents a pushable crate/box in the game.
    /// Supports grid checking, pushing animations, and triggering pressure plates.
    /// </summary>
    [RequireComponent(typeof(BoxCollider))]
    public class PushableBox : MonoBehaviour
    {
        [Header("Push Settings")]
        [SerializeField] private float pushDuration = 0.25f;
        [SerializeField] private LayerMask obstacleLayer;

        private bool isMoving = false;
        public bool IsMoving => isMoving;

        public System.Action<Vector3> OnPushed;

        public bool TryPush(Vector3 direction)
        {
            if (isMoving) return false;

            // Check if space behind box is clear
            if (Physics.Raycast(transform.position, direction, 1f, obstacleLayer))
            {
                return false;
            }

            StartCoroutine(ExecutePush(direction));
            return true;
        }

        private IEnumerator ExecutePush(Vector3 direction)
        {
            isMoving = true;
            OnPushed?.Invoke(direction);

            Vector3 startPos = transform.position;
            Vector3 targetPos = startPos + direction;
            float elapsed = 0f;

            while (elapsed < pushDuration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / pushDuration);
                // Smooth step
                t = t * t * (3f - 2f * t);
                transform.position = Vector3.Lerp(startPos, targetPos, t);
                yield return null;
            }

            transform.position = new Vector3(
                Mathf.Round(targetPos.x),
                Mathf.Round(targetPos.y),
                Mathf.Round(targetPos.z)
            );

            isMoving = false;
        }
    }
}
