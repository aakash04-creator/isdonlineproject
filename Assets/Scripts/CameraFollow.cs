using UnityEngine;

namespace BoxCrafter.Core
{
    /// <summary>
    /// Smooth follow isometric camera with gentle damping, lookahead, and screen shake.
    /// </summary>
    public class CameraFollow : MonoBehaviour
    {
        [Header("Target & Offset")]
        [SerializeField] private Transform target;
        [SerializeField] private Vector3 offset = new Vector3(-8f, 10f, -8f);
        [SerializeField] private float smoothSpeed = 5f;

        private Vector3 shakeOffset = Vector3.zero;
        private float shakeDuration = 0f;
        private float shakeMagnitude = 0.2f;

        private void LateUpdate()
        {
            if (target == null) return;

            Vector3 desiredPosition = target.position + offset;
            Vector3 smoothedPosition = Vector3.Lerp(transform.position, desiredPosition, smoothSpeed * Time.deltaTime);

            if (shakeDuration > 0)
            {
                shakeOffset = Random.insideUnitSphere * shakeMagnitude;
                shakeOffset.y = 0;
                shakeDuration -= Time.deltaTime;
            }
            else
            {
                shakeOffset = Vector3.zero;
            }

            transform.position = smoothedPosition + shakeOffset;
        }

        public void TriggerShake(float duration = 0.2f, float magnitude = 0.25f)
        {
            shakeDuration = duration;
            shakeMagnitude = magnitude;
        }
    }
}

